import type { NextPage } from 'next';

import { ContainerBlock } from '../components/ContainerBlock';

const Home: NextPage = () => {
  return (
    <ContainerBlock>
      <h1 className="text-3xl font-bold underline">Welcome!</h1>
    </ContainerBlock>
  );
};

export default Home;
