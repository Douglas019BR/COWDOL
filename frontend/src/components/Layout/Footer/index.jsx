import React from 'react';
import { FooterContainer, FooterText } from './styles';


const Footer = () => {
  return (
    <FooterContainer>
      <FooterText>
        © {new Date().getFullYear()} COWDOL. Todos os direitos reservados.
      </FooterText>
    </FooterContainer>
  );
};
export default Footer;
