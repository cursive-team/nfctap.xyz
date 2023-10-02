import React from "react";
import { SecondaryHeader } from "../shared/Headers";
import {
  PrimaryFontSmall1,
} from "../core";
import { Button } from "@/components/ui/button";

export enum FirstTimeUserResponse {
  NONE = "NONE",
  YES = "YES",
  RETRIEVE = "RETRIEVE",
}

const FirstTimeUserScreen = ({
  setUserResponse,
}: {
  setUserResponse: (response: FirstTimeUserResponse) => void;
}) => {
  const handleYesClick = () => {
    setUserResponse(FirstTimeUserResponse.YES);
  };

  const handleNoClick = () => {
    setUserResponse(FirstTimeUserResponse.RETRIEVE);
  };

  return (
    <div>
      <SecondaryHeader />
      <div className="px-4">
        <div className="flex py-10 flex-col items-center ">
          <div className="px-2 justify-center items-start inline-flex self-stretch">
            <div className="flex flex-col gap-8 w-[264px]">
              <span className="font-helvetica text-[23px] font-bold leading-none text-woodsmoke-100">
                First time user?
              </span>
              <div className="flex flex-col items-center gap-6">
                <Button onClick={handleYesClick}>
                  YES
                </Button>
                <Button variant="link" onClick={handleNoClick}>
                  NO, RETRIEVE MY COLLECTION
                </Button>
              </div>
              <div className="flex py-4 flex-col justify-center items-center gap-4 self-stretch text-center">
                <span className="font-helvetica text-[13px] font-normal text-woodsmoke-400">
                  You may have cleared your browser cache, in which case you
                  should retrieve an old collection. Your permanent storage is
                  private and separate from this app.
                </span>
                <span className="font-helvetica text-[13px] font-medium text-snow-flurry-200">
                  <a href="http://nfctap.xyz">nfctap.xyz</a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirstTimeUserScreen;

