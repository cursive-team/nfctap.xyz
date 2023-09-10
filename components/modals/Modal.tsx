import { ReactNode } from "react";
import {
  ModalBackground,
  ModalContainer,
  ModalDiv,
  ModalHeader,
} from "../shared/Modal";

export default function Modal({ children }: { children: ReactNode }) {
  return (
    <ModalBackground>
      <ModalContainer>
        <ModalDiv>
          <ModalHeader />
          {children}
        </ModalDiv>
      </ModalContainer>
    </ModalBackground>
  );
}
