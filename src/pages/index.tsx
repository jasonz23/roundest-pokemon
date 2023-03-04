import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import { trpc } from "@/utils/trpc";
import { getOptionsForVote } from "@/utils/pokemon";
import { useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [ids, setIds] = useState(() => getOptionsForVote());
  const [first, second] = ids;
  const dataOne = trpc.getPokemonByID.useQuery({ id: first });
  const dataTwo = trpc.getPokemonByID.useQuery({ id: second });
  const pokemonOne = dataOne.data?.pokemon;
  const pokemonTwo = dataTwo.data?.pokemon;
  console.log(pokemonOne, pokemonTwo);

  if (dataOne.isLoading || dataTwo.isLoading) {
    return null;
  }
  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center">
      <div className="text-2xl text-center mb-2">Which Pokemon is rounder?</div>
      <div className="border rounded p-8 flex justify-between max-w-2xl item-center">
        <div className="w-64 h-64 bg-slate-300 flex flex-col items-center">
          <img
            className="w-full"
            src={pokemonOne?.sprites?.front_default ?? undefined}
            alt="pokemon1"
          />
          <div className="capitalize">{pokemonOne?.name}</div>
        </div>
        <div className="px-8 self-center">OR</div>
        <div className="w-64 h-64 bg-slate-300 flex flex-col items-center">
          <img
            className="w-full"
            src={pokemonTwo?.sprites?.front_default ?? undefined}
            alt="pokemon1"
          />
          <div className="capitalize">{pokemonTwo?.name}</div>
        </div>
      </div>
    </div>
  );
}
