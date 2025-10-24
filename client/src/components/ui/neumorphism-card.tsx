import React from 'react';
import styled from 'styled-components';

interface NeumorphismCardProps {
  children?: React.ReactNode;
  className?: string;
  width?: string;
  height?: string;
}

const NeumorphismCard: React.FC<NeumorphismCardProps> = ({ 
  children, 
  className = '', 
  width = '190px', 
  height = '254px' 
}) => {
  return (
    <StyledWrapper className={className}>
      <div className="card" style={{ width, height }}>
        {children}
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .card {
    border-radius: 30px;
    background: hsl(var(--card));
    box-shadow: 10px 10px 20px rgba(33, 150, 243, 0.12),
                -10px -10px 20px rgba(66, 165, 245, 0.08);
    display: flex;
    flex-direction: column;
    padding: 20px;
    color: hsl(var(--card-foreground));
    
    &:hover {
      box-shadow: 15px 15px 25px rgba(33, 150, 243, 0.18),
                  -15px -15px 25px rgba(66, 165, 245, 0.12);
      transition: box-shadow 0.3s ease;
    }
  }
`;

export default NeumorphismCard;