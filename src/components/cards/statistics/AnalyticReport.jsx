
// project import
import MainCard from 'components/MainCard';

// assets
import PropTypes from 'prop-types';
import { Grid, Typography, IconButton } from '@mui/material';

export default function AnalyticReport({ color = 'primary', icon: Icon, iconSx = {}, title, children }) {
  return (
    <MainCard sx={{ padding: '15px',height:'200px'}}>
      <Grid container spacing={2} alignItems="center" justifyContent="flex-start">
        <IconButton sx={iconSx}>
          <Icon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }} color="text.secondary">
          {title}
        </Typography>
      </Grid>

      <Grid container spacing={2} justifyContent="center" sx={{mt:1}}>
        <Grid item xs={12}>
          {children}
        </Grid>
      </Grid>
    </MainCard>
  );
}

AnalyticReport.propTypes = {
  color: PropTypes.string,
  icon: PropTypes.elementType.isRequired,
  iconSx: PropTypes.object,
  title: PropTypes.string.isRequired,
  children: PropTypes.node
};
