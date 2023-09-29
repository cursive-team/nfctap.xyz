import React from "react";
import { PrimaryFontXS, PrimaryFontBase } from "../core";
import styled from "styled-components";

interface InputProps {
  value: string;
  setValue: (value: string) => void;
  header?: string;
  disabled?: boolean;
}

export const Input = ({ value, setValue, header, disabled }: InputProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  return (
    <div>
      {header && (
        <HeaderDiv>
          <HeaderText>{header}</HeaderText>
        </HeaderDiv>
      )}
      <InputField disabled={disabled} value={value} onChange={handleChange} />
    </div>
  );
};

const InputField = styled.input`
  display: flex;
  width: 264px;
  height: 42px;
  flex-direction: column;
  text-align: center;
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
