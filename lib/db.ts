import { db } from './firebase'
import { doc, collection, addDoc, getDocs, query, where, orderBy, updateDoc, deleteDoc, arrayUnion, arrayRemove, setDoc, getDoc } from 'firebase/firestore'

export async function createNotification(userId: string, title: string, message: string) {
  const ref = collection(db, 'notifications')
  await addDoc(ref, {
    userId,
    title,
    message,
    read: false,
    createdAt: new Date().toISOString(),
  })
}

export async function cancelBooking(bookingId: string) {
  await updateDoc(doc(db, 'bookings', bookingId), { status: 'dibatalkan' })
}

export async function createBooking(data: {
  userId: string
  userName: string
  userEmail: string
  userWa: string
  psychologistId: string
  psychologistName: string
  serviceId: string
  serviceName: string
  date: string
  time: string
  mode: string
  complaint: string
  fee: string
}) {
  const ref = collection(db, 'bookings')
  const bookingRef = await addDoc(ref, {
    ...data,
    status: 'dikonfirmasi',
    createdAt: new Date().toISOString(),
  })
  await createNotification(
    data.userId,
    'Booking Dikonfirmasi',
    `Jadwal konsultasi dengan ${data.psychologistName} pada ${data.date} pukul ${data.time} telah dikonfirmasi.`
  )
  return bookingRef
}

export async function getUserBookings(userId: string) {
  const ref = collection(db, 'bookings')
  const q = query(ref, where('userId', '==', userId), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function getUserFavorites(userId: string) {
  const ref = doc(db, 'users', userId)
  const snap = await getDoc(ref)
  const data = snap.data()
  return data?.favorites || []
}

export async function toggleFavorite(userId: string, psychologistId: string) {
  const ref = doc(db, 'users', userId)
  const snap = await getDoc(ref)
  const data = snap.data()
  const favs: string[] = data?.favorites || []
  if (favs.includes(psychologistId)) {
    await updateDoc(ref, { favorites: arrayRemove(psychologistId) })
  } else {
    await updateDoc(ref, { favorites: arrayUnion(psychologistId) })
  }
}

export async function saveNotificationSettings(userId: string, settings: Record<string, boolean>) {
  const ref = doc(db, 'users', userId)
  await setDoc(ref, { notificationSettings: settings }, { merge: true })
}

export async function getNotificationSettings(userId: string) {
  const ref = doc(db, 'users', userId)
  const snap = await getDoc(ref)
  return snap.data()?.notificationSettings || {}
}

export async function saveMood(userId: string, mood: number) {
  const today = new Date().toISOString().split('T')[0]
  const ref = doc(db, 'users', userId, 'moods', today)
  await setDoc(ref, { mood, date: today, updatedAt: new Date().toISOString() }, { merge: true })
}

export async function getTodayMood(userId: string) {
  const today = new Date().toISOString().split('T')[0]
  const ref = doc(db, 'users', userId, 'moods', today)
  const snap = await getDoc(ref)
  return snap.exists() ? snap.data().mood : null
}

export async function getMoodHistory(userId: string) {
  const ref = collection(db, 'users', userId, 'moods')
  const q = query(ref, orderBy('date', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data())
}

export async function getUserNotifications(userId: string) {
  const ref = collection(db, 'notifications')
  const q = query(ref, where('userId', '==', userId), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function markNotificationRead(notificationId: string) {
  await updateDoc(doc(db, 'notifications', notificationId), { read: true })
}

export async function markAllNotificationsRead(userId: string) {
  const ref = collection(db, 'notifications')
  const q = query(ref, where('userId', '==', userId), where('read', '==', false))
  const snap = await getDocs(q)
  const updates = snap.docs.map(d => updateDoc(doc(db, 'notifications', d.id), { read: true }))
  await Promise.all(updates)
}

export async function getUnreadNotificationCount(userId: string) {
  const ref = collection(db, 'notifications')
  const q = query(ref, where('userId', '==', userId), where('read', '==', false))
  const snap = await getDocs(q)
  return snap.size
}

export async function submitReview(data: {
  bookingId: string
  userId: string
  psychologistId: string
  rating: number
  comment: string
}) {
  const ref = collection(db, 'reviews')
  await addDoc(ref, { ...data, createdAt: new Date().toISOString() })
}

export async function getSavedArticles(userId: string) {
  const ref = doc(db, 'users', userId)
  const snap = await getDoc(ref)
  return snap.data()?.savedArticles || []
}

export async function toggleSavedArticle(userId: string, articleId: string) {
  const ref = doc(db, 'users', userId)
  const snap = await getDoc(ref)
  const saved: string[] = snap.data()?.savedArticles || []
  if (saved.includes(articleId)) {
    await updateDoc(ref, { savedArticles: arrayRemove(articleId) })
  } else {
    await updateDoc(ref, { savedArticles: arrayUnion(articleId) })
  }
}

export async function getArticles() {
  const ref = collection(db, 'artikel')
  const q = query(ref, orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}
