'use client';

import Search from "./components/Search";
import { Suspense } from "react";

const Home = () => {
  return (
    <>
      <h1 className='home'>Search</h1>
      <Suspense>
        <Search />
      </Suspense>
    </>
  );
}

export default Home;
