import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import { trpc } from "@/utils/trpc";
import styles from "@/styles/Home.module.css";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const { data, isLoading } = trpc.hello.useQuery({ text: "client" });
  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center">
      <div className="text-2xl text-center mb-2">Which Pokemon is rounder?</div>
      <div className="border rounded p-8 flex justify-between max-w-2xl item-center">
        <div className="w-16 h-16 bg-red-200">meow</div>
        <div className="p-8">VS</div>
        <div className="w-16 h-16 bg-red-200"></div>
      </div>
    </div>
  );
}
