import { styled } from '@mui/system';
import { Card } from '@mui/material';

const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 400,
  margin: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
}));
export default StyledCard;