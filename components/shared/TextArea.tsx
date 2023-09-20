import React from "react";
import styled from "styled-components";
import { PrimaryFontXS } from "@/components/core";

interface TextAreaProps {
  value: string;
  setValue: (value: string) => void;
  header?: string;
}

export const TextArea = ({ value, setValue, header }: TextAreaProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(event.target.value);
  };

  return (
    <div>
      {header && (
        <HeaderDiv>
          <HeaderText>{header}</HeaderText>
        </HeaderDiv>
      )}
      <TextAreaField value={value} onChange={handleChange} />
    </div>
  );
};

const TextAreaField = styled.textarea`
  display: flex;
  width: 264px;
  height: 126px;
  padding: 4px 4px 4px 4px;
  flex-direction: column;
  text-align: left;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;

  border-radius: 4px;
  border: 1px solid var(--snow-flurry-200);
  background-color: var(--woodsmoke-950);

  color: var(--snow-flurry-200);
  font-family: "Helvetica Neue";
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
`;

const HeaderDiv = styled.div`
  display: flex;
  padding: 8px;
  gap: 8px;
`;

const HeaderText = styled(PrimaryFontXS)`
  color: var(--woodsmoke-200, #d1d1d1);
`;
