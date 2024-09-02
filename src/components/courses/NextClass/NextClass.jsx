import { getFirestore } from "firebase-admin/firestore";
import { getFirebaseAdminApp } from '@/app/firebase';

const db = getFirestore(getFirebaseAdminApp());

const days = {
  0: 'Domingo',
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado'
};

export const NextClass = async ({ tokens }) => {
  const snapshotClasses = await db.collection('classes').get();
  const snapshotUsers = await db.collection('users').doc(tokens.decodedToken.uid).get();

  const classes = [];

  const user = snapshotUsers.data();
  const userCourseIds = user.enrolledCourses.map(course => course._path.segments[1]);
  snapshotClasses.forEach(doc => {
    const currentDay = new Date().getDay();
    if (!userCourseIds.includes(doc.data().courseId._path.segments[1])) {
      return;
    }
    classes.push({ id: doc.id, ...doc.data(), today: currentDay });
  });

  return (
    <>
      <h2 className="text-3xl font-bold text-white mb-6 ps-6 pt-6">Tu próxima clase</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 p-6">
        {classes.flatMap(classItem => 
          classItem.days.map(day => (
            <div key={`${classItem.id}-${day}`} className="course-card p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-2xl font-bold mb-2 text-gray-700">{days[day]}</h2>
              <p className="text-gray-700 mb-4">{classItem.time}</p>
              <p className="text-gray-900"><strong></strong> {classItem.location}</p>
              {days[classItem.today] === days[day] && (
                <p className="text-green-500 font-bold">Hoy</p>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}