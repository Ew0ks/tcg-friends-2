import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import AchievementList from '@/components/AchievementList';

export default function AchievementsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-game-accent mb-2">Achievements</h1>
        <p className="text-gray-400">
          Débloquez des achievements en collectionnant des cartes, en échangeant avec d&apos;autres joueurs et en ouvrant des boosters !
        </p>
      </div>
      <AchievementList />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}; 