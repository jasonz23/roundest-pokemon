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
import { useEffect, useState } from "react";
import useWindowSize from "@rooks/use-window-size";
import { sign } from "crypto";

export default function Home() {
  const { innerWidth } = useWindowSize();
  const updateHighestVoteMutation = trpc.updateHighestScore.useMutation();
  const signInMutation = trpc.signIn.useMutation();
  const signUpMutation = trpc.signUp.useMutation();
  const [ids, setIds] = useState(() => getOptionsForVote());
  const [baseStatIndex, setBaseStatIndex] = useState(() =>
    getRandomBaseStatIndex()
  );

  const [showModal, setShowModal] = useState(0);
  const [currScore, setCurrScore] = useState(0);
  const [accountInfo, setAccountInfo] = useState<any>({});
  const [first, second] = ids;
  const dataOne = trpc.getPokemonByID.useQuery({ id: first });
  const dataTwo = trpc.getPokemonByID.useQuery({ id: second });
  const pokemonOne = dataOne.data?.pokemon;
  const pokemonTwo = dataTwo.data?.pokemon;

  // TODO: replace any with actual type
  const sendVote = (index: number, selected: any, notSelected: any): void => {
    if (
      selected?.stats[baseStatIndex]?.base_stat >=
      notSelected?.stats[baseStatIndex]?.base_stat
    ) {
      if (index === 0) {
        setIds([selected?.id, getRandomPokemon(notSelected?.id)]);
      } else {
        setIds([getRandomPokemon(notSelected?.id), selected?.id]);
      }
      setCurrScore(currScore + 1);
    } else {
      toast.info("Wrong", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      if (Object.keys(accountInfo).length != 0) {
        if (accountInfo.highestScore < currScore) {
          updateHighestVoteMutation.mutate({
            userName: accountInfo?.userName ?? "null",
            highestScore: currScore,
          });
          accountInfo.highestScore = currScore;
        }
      }
      setTimeout(() => {
        setIds(getOptionsForVote());
        setBaseStatIndex(getRandomBaseStatIndex());
        setCurrScore(0);
      }, 100);
    }
  };

  const openSignInModal = () => {
    setShowModal(1);
  };

  const openSignUpModal = () => {
    setShowModal(2);
  };

  const signIn = async () => {
    signInMutation.mutateAsync({
      userName: (document.getElementById("user-name") as HTMLInputElement)
        .value,
      password: (document.getElementById("password") as HTMLInputElement).value,
    });

    if (signInMutation.isSuccess) {
      if (signInMutation.data?.response?.success) {
        (document.getElementById("user-name") as HTMLInputElement).value = "";
        (document.getElementById("password") as HTMLInputElement).value = "";
        setAccountInfo(signInMutation.data?.response?.data ?? {});
        setShowModal(0);
        toast.success("Signed In");
        signInMutation.reset();
      } else {
        toast.error(
          signInMutation.data?.response?.error ?? "User does not Exist"
        );
      }
    } else {
      toast.error("Interal Error 500: please retry again");
    }
  };

  const signUp = () => {
    signUpMutation.mutateAsync({
      userName: (document.getElementById("user-name") as HTMLInputElement)
        .value,
      password: (document.getElementById("password") as HTMLInputElement).value,
    });
    toast.success("Account Created");
    setShowModal(0);
    // TODO :fix it
    // const success = signUpMutation.data?.response?.success ?? false;
    // if (signUpMutation.isSuccess) {
    //   setShowModal(0);
    //   setAccountInfo(signUpMutation.data?.response?.data ?? {});
    // } else {
    //   //
    // }
  };

  const signOut = () => {
    setAccountInfo({});
    toast.success("Signed Out");
  };

  return (
    <>
      <div
        className="w-screen h-20 flex flex-row justify-between"
        style={{ position: "absolute" }}
      >
        <div className="m-2 p-1 font-bold text-2xl">Pokemon Compare Game</div>
        <div>
          {Object.keys(accountInfo).length == 0 ? (
            <div className="flex items-center">
              <div>Continuing Playing as Guest?</div>
              <button
                className="m-2 border-2 p-1 rounded-md"
                onClick={() => openSignInModal()}
              >
                Sign In
              </button>
              <button
                className="m-2 border-2 p-1 rounded-md"
                onClick={() => openSignUpModal()}
              >
                Create Account
              </button>
            </div>
          ) : (
            <button
              className="m-2 border-2 p-1 rounded-md"
              onClick={() => signOut()}
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
      <ToastContainer />
      {(dataOne.isLoading || dataTwo.isLoading) && (
        <div
          style={{
            position: "fixed",
            zIndex: "500",
            marginLeft: "47vw",
            marginTop: "43vh",
            width: "100%",
            height: "100%",
          }}
        >
          <div className="lds-roller">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      )}
      <div
        className="h-screen w-screen flex flex-col justify-center items-center"
        style={{
          filter:
            dataOne.isLoading || dataTwo.isLoading || showModal
              ? "blur(8px)"
              : "",
        }}
      >
        <div className="text-2xl text-center mb-2">
          Which Pokemon has higher
          <span className="capitalize font-bold">
            {" " +
              pokemonOne?.stats[baseStatIndex]?.stat?.name.replace("-", " ")}
          </span>
          ?
        </div>
        <div
          className="border rounded p-8 flex justify-between max-w-2xl item-center"
          style={
            {
              //implement for mobile
              // flexDirection: innerWidth ?? 0 < 600 ? "column" : "row",
            }
          }
        >
          <div className="w-64 h-64 bg-slate-300 flex flex-col items-center">
            <button
              className="w-full h-full"
              onClick={() => sendVote(0, pokemonOne, pokemonTwo)}
              disabled={dataOne.isLoading}
            >
              {!dataOne.isLoading && (
                <img
                  className="w-full hover:scale-110"
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
              disabled={dataTwo.isLoading}
            >
              {!dataTwo.isLoading && (
                <img
                  className="w-full hover:scale-110"
                  src={pokemonTwo?.sprites?.front_default ?? undefined}
                  alt="pokemon1"
                />
              )}
            </button>
            <div className="capitalize">{pokemonTwo?.name}</div>
          </div>
        </div>
        <div className="flex justify-between p-8" style={{ width: "42rem" }}>
          <div>Current Score: {currScore}</div>
          <div>
            Highest Score:
            {Object.keys(accountInfo).length == 0
              ? "Please Sign In"
              : accountInfo?.highestScore}
          </div>
        </div>
      </div>
      {/* Modal */}
      {showModal ? (
        <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
          <div className="relative w-auto my-6 mx-auto max-w-3xl">
            {/*content*/}
            <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
              {/*header*/}
              <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
                <h3 className="text-3xl font-semibold text-black">
                  {showModal === 1 ? "Sign In" : "Create Account"}
                </h3>
                <button
                  className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                  onClick={() => setShowModal(0)}
                >
                  <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                    ×
                  </span>
                </button>
              </div>
              {/*body*/}
              <div className="relative p-6 flex-auto w-2xl">
                <div>
                  <label className="block mb-2 text-sm font-medium text-black">
                    User Name
                  </label>
                  <input
                    id="user-name"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-black">
                    Password
                  </label>
                  <input
                    id="password"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  />
                </div>
              </div>
              {/*footer*/}
              <div className="flex items-center justify-end p-6 border-t border-solid border-slate-200 rounded-b">
                <button
                  className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                  type="button"
                  onClick={() => setShowModal(0)}
                >
                  Close
                </button>
                <button
                  className="bg-blue-800 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                  type="button"
                  onClick={
                    showModal === 1
                      ? () => {
                          signIn();
                        }
                      : () => {
                          signUp();
                        }
                  }
                >
                  {showModal === 1 ? "Sign In" : "Create Account"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
