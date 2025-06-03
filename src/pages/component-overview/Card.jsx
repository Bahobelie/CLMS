import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  IconButton,
  styled,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';


const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 445,
  margin: theme.spacing(3),
  borderRadius: '12px',
  transition: 'transform 0.15s ease-in-out',
  '&:hover': {
    transform: 'scale(1.0006)',
    boxShadow: theme.shadows[6],
  },
}));

const GenericCard=({ title,content,onClick,bgcolor,sx,children,icon}) => {
const theme=useTheme();
  return (
    <StyledCard sx={sx} onClick={onClick}>
      {title && (
        <CardHeader
          sx={{ alignItems: 'center' }} // 🔥 Center the action vertically
          action={
            <IconButton
              sx={{
                backgroundColor:bgcolor,
                '&:hover':{
                backgroundColor:bgcolor
                }}}
              aria-label="settings">
              {icon}
            </IconButton>
          }
          title={title}
        />
      )}

      {(content || children) && (
        <CardContent>
          {content}
          {children}
        </CardContent>
      )}
    </StyledCard>
  );
};

export default GenericCard;