import Head from "next/head";
import Image from "next/image";
import { trpc } from "@/utils/trpc";
import {
  getOptionsForVote,
  getRandomBaseStatIndex,
  getRandomPokemon,
} from "@/utils/pokemon";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";

export default function Home() {
  const [ids, setIds] = useState(() => getOptionsForVote());
  const [baseStatIndex, setBaseStatIndex] = useState(() =>
    getRandomBaseStatIndex()
  );

  const [first, second] = ids;
  const dataOne = trpc.getPokemonByID.useQuery({ id: first });
  const dataTwo = trpc.getPokemonByID.useQuery({ id: second });
  const pokemonOne = dataOne.data?.pokemon;
  const pokemonTwo = dataTwo.data?.pokemon;

  // TODO: replace any with actual type
  const sendVote = (index: number, selected: any, notSelected: any) => {
    if (
      selected?.stats[baseStatIndex]?.base_stat >=
      notSelected?.stats[baseStatIndex]?.base_stat
    ) {
      if (index === 0) {
        setIds([selected?.id, getRandomPokemon(notSelected?.id)]);
      } else {
        setIds([getRandomPokemon(notSelected?.id), selected?.id]);
      }
    } else {
      toast("Wrong", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      setTimeout(() => {
        setIds(getOptionsForVote());
      }, 100);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="h-screen w-screen flex flex-col justify-center items-center">
        <div className="text-2xl text-center mb-2">
          Which Pokemon has higher
          <span className="capitalize">
            {pokemonOne?.stats[baseStatIndex]?.stat?.name} ?
          </span>
        </div>
        <div className="border rounded p-8 flex justify-between max-w-2xl item-center">
          <div className="w-64 h-64 bg-slate-300 flex flex-col items-center">
            <button
              className="w-full h-full"
              onClick={() => sendVote(0, pokemonOne, pokemonTwo)}
            >
              {!dataOne.isLoading && (
                <img
                  className="w-full"
                  src={pokemonOne?.sprites?.front_default ?? undefined}
                  alt="pokemon1"
                />
              )}
            </button>

            <div className="capitalize">{pokemonOne?.name}</div>
          </div>
          <div className="px-8 self-center">OR</div>
          <div className="w-64 h-64 bg-slate-300 flex flex-col items-center">
            <button
              className="w-full h-full"
              onClick={() => sendVote(1, pokemonTwo, pokemonOne)}
            >
              {!dataTwo.isLoading && (
                <img
                  className="w-full"
                  src={pokemonTwo?.sprites?.front_default ?? undefined}
                  alt="pokemon1"
                />
              )}
            </button>
            <div className="capitalize">{pokemonTwo?.name}</div>
          </div>
        </div>
      </div>
    </>
  );
}
