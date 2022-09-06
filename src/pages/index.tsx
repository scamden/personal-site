import { Hero } from '@components/Hero';
import type { NextPage } from 'next';

import { ContainerBlock } from '../components/ContainerBlock';

const Home: NextPage = () => {
  return (
    <ContainerBlock>
      <Hero />
    </ContainerBlock>
  );
};

export default Home;
