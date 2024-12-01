import React from 'react';
import CarouselRatio from '../../common/Carousel/index';
import { StyledHeader, CarouselContainer } from './styles';

const Header = () => {
  return (
    <StyledHeader>
      <CarouselContainer>
        <CarouselRatio />
      </CarouselContainer>
    </StyledHeader>
  );
};

export default Header;