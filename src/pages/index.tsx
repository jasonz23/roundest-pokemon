import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import { trpc } from "@/utils/trpc";
import styles from "@/styles/Home.module.css";
import { getOptionsForVote } from "@/utils/pokemon";
import { useEffect, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [firstID, setFirstID] = useState(0);
  const [secondID, setSecondID] = useState(0);

  useEffect(() => {
    const [first, second] = getOptionsForVote();
    setFirstID(first);
    setSecondID(second);
  }, []);
  console.log(firstID, secondID);
  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center">
      <div className="text-2xl text-center mb-2">Which Pokemon is rounder?</div>
      <div className="border rounded p-8 flex justify-between max-w-2xl item-center">
        <div className="w-16 h-16 bg-red-800">{firstID}</div>
        <div className="px-8 self-center">VS</div>
        <div className="w-16 h-16 bg-red-800">{secondID}</div>
      </div>
    </div>
  );
}
