$apiKey = "AIzaSyCya4RuqYRrj4HRLjkAHcVVs7iwXg0hFg8"
$projectId = "mindcare-60684"
$email = "admin@psyoasis.com"
$password = "Admin123!"
$displayName = "Admin PsyOasis"

Write-Host "=== Setup Akun Admin PsyOasis ===" -ForegroundColor Cyan
Write-Host "Email: $email" -ForegroundColor Yellow
Write-Host "Password: $password" -ForegroundColor Yellow
Write-Host ""

# 1. Sign up user via Firebase Auth REST API
Write-Host "[1/3] Membuat akun di Firebase Auth..." -ForegroundColor Cyan
$signUpBody = @{
    email = $email
    password = $password
    returnSecureToken = $true
    displayName = $displayName
} | ConvertTo-Json

try {
    $signUpResponse = Invoke-RestMethod -Uri "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=$apiKey" -Method Post -ContentType "application/json" -Body $signUpBody
    $uid = $signUpResponse.localId
    $idToken = $signUpResponse.idToken
    Write-Host "  Akun berhasil dibuat! UID: $uid" -ForegroundColor Green
} catch {
    $errorMsg = $_.Exception.Response
    if ($errorMsg) {
        $reader = New-Object System.IO.StreamReader($errorMsg.GetResponseStream())
        $responseBody = $reader.ReadToEnd() | ConvertFrom-Json
        if ($responseBody.error.message -eq "EMAIL_EXISTS") {
            Write-Host "  Email sudah terdaftar, coba login..." -ForegroundColor Yellow
            # Try to login
            $loginBody = @{
                email = $email
                password = $password
                returnSecureToken = $true
            } | ConvertTo-Json
            try {
                $loginResponse = Invoke-RestMethod -Uri "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=$apiKey" -Method Post -ContentType "application/json" -Body $loginBody
                $uid = $loginResponse.localId
                $idToken = $loginResponse.idToken
            } catch {
                $loginError = $_.Exception.Response
                $loginReader = New-Object System.IO.StreamReader($loginError.GetResponseStream())
                $loginBodyErr = $loginReader.ReadToEnd() | ConvertFrom-Json
                Write-Host "  Login gagal: $($loginBodyErr.error.message)" -ForegroundColor Red
                Write-Host "  Mungkin password berbeda. Reset password via Firebase Console..." -ForegroundColor Yellow
                # Try password reset via REST API
                $resetBody = @{
                    requestType = "PASSWORD_RESET"
                    email = $email
                } | ConvertTo-Json
                try {
                    $resetResponse = Invoke-RestMethod -Uri "https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=$apiKey" -Method Post -ContentType "application/json" -Body $resetBody
                    Write-Host "  Email reset password terkirim ke $email" -ForegroundColor Green
                } catch {
                    Write-Host "  Gagal kirim reset password: $_" -ForegroundColor Red
                }
                Write-Host "  Buat akun dengan email berbeda..." -ForegroundColor Yellow
                $altEmail = "admin@psy-oasis.com"
                $altBody = @{
                    email = $altEmail
                    password = $password
                    returnSecureToken = $true
                    displayName = $displayName
                } | ConvertTo-Json
                try {
                    $altResponse = Invoke-RestMethod -Uri "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=$apiKey" -Method Post -ContentType "application/json" -Body $altBody
                    $uid = $altResponse.localId
                    $idToken = $altResponse.idToken
                    $email = $altEmail
                    Write-Host "  Akun baru dibuat dengan email: $altEmail" -ForegroundColor Green
                } catch {
                    Write-Host "  Gagal buat akun alternatif: $_" -ForegroundColor Red
                    exit 1
                }
            }
        } else {
            Write-Host "  Error: $($responseBody.error.message)" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "  Error: $_" -ForegroundColor Red
        exit 1
    }
}

# 2. Set admin role in Firestore
Write-Host "[2/3] Set role admin di Firestore..." -ForegroundColor Cyan
$firestoreBody = @{
    fields = @{
        displayName = @{ stringValue = $displayName }
        email = @{ stringValue = $email }
        role = @{ stringValue = "admin" }
        status = @{ stringValue = "active" }
        createdAt = @{ stringValue = (Get-Date -Format "o") }
    }
} | ConvertTo-Json

try {
    $firestoreUrl = "https://firestore.googleapis.com/v1/projects/$projectId/databases/(default)/documents/users/$uid"
    $firestoreResponse = Invoke-RestMethod -Uri $firestoreUrl -Method Patch -ContentType "application/json" -Body $firestoreBody -Headers @{ "Authorization" = "Bearer $idToken" }
    Write-Host "  Role admin berhasil diset!" -ForegroundColor Green
} catch {
    Write-Host "  Error Firestore: $_" -ForegroundColor Red
    Write-Host "  Mencoba tanpa token..." -ForegroundColor Yellow
    # Some Firebase projects allow unauthenticated Firestore writes if rules allow
    try {
        $firestoreResponse = Invoke-RestMethod -Uri $firestoreUrl -Method Patch -ContentType "application/json" -Body $firestoreBody
        Write-Host "  Role admin berhasil diset!" -ForegroundColor Green
    } catch {
        Write-Host "  Error: $_" -ForegroundColor Red
    }
}

# 3. Verify
Write-Host "[3/3] Verifikasi..." -ForegroundColor Cyan
try {
    $userBody = @{
        idToken = $idToken
    } | ConvertTo-Json
    $userResponse = Invoke-RestMethod -Uri "https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=$apiKey" -Method Post -ContentType "application/json" -Body $userBody
    $userData = $userResponse.users[0]
    Write-Host "  Email: $($userData.email)" -ForegroundColor Green
    Write-Host "  UID: $($userData.localId)" -ForegroundColor Green
    Write-Host "" -ForegroundColor Green
    Write-Host "=== SETUP SELESAI ===" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Sekarang kamu bisa login di /admin/login dengan:" -ForegroundColor White
    Write-Host "  Email: $email" -ForegroundColor Yellow
    Write-Host "  Password: $password" -ForegroundColor Yellow
} catch {
    Write-Host "  Error verifikasi: $_" -ForegroundColor Red
}
