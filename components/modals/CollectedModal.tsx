import { AppleWalletButton } from "../wallet/AppleWalletButton";
import { GoogleWalletButton } from "../wallet/GoogleWalletButton";
import styled from "styled-components";

export default function CollectedModal() {
  return (
    <ModalBackground>
      <ModalContainer>
        <Modal>
          {/* <MainHeader /> */}
          <AppleWalletButton />
          <GoogleWalletButton />
        </Modal>
      </ModalContainer>
    </ModalBackground>
  );
}

const ModalBackground = styled.div`
  display: flex;
  width: 100vw;
  height: 100vh;
  padding: 40px 0px 80px 0px;
  flex-direction: column;
  align-items: center;
  background: #282828;
`;

const ModalContainer = styled.div`
  display: flex;
  width: 390px;
  padding: 0px 16px;
  flex-direction: column;
  align-items: center;
  flex: 1 0 0;
`;

const Modal = styled.div`
  display: flex;
  padding-bottom: 0px;
  flex-direction: column;
  align-items: center;
  flex: 1 0 0;
  align-self: stretch;
  border-radius: 8px;
  background: var(--woodsmoke-950);
`;
