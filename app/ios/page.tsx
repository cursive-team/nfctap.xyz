"use client";
import { isIOS } from "react-device-detect";
import axios from "axios";
import { useState } from "react";

export default function IosPage() {
  // const generatePass = async () => {
  //   const res = axios.get('/api/generatePass')

  // }
  const [owner, setOwner] = useState("");
  const [signature, setSignature] = useState(
    "0xa02fe270dd97d121c00373408f4ebc34e1ff45a49eb1068ee4f9e4063da7b3f8"
  );
  const [note, setNote] = useState("");

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div className="flex flex-col bg-white shadow-md rounded px-8 pt-6 pb-8 gap-4">
        <h1 className="text-gray-700 text-xl font-bold">
          Create Your Jubmoji 🚀
        </h1>
        <div className="">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="username"
          >
            Username
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="username"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            type="text"
            placeholder="@username"
            autoFocus
          />
        </div>
        <div className="mb-2">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="signature"
          >
            Signature
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="signature"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            type="text"
            placeholder="Signature"
          />
        </div>
        <div className="mb-2">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="note"
          >
            Note
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            type="text"
            placeholder="Note (optional)"
          />
        </div>
        <a
          href={`/api/generatePass?owner=${owner}&signature=${signature}&note=${note}`}
        >
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
          >
            Generate Pass
          </button>
        </a>
      </div>
    </div>
  );
}
