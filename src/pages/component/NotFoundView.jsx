import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import  RouterLink  from './RouterLink';
import NotFoundImage from '../../assets/illustartion/illustration-404.svg';

// ----------------------------------------------------------------------

const NotFoundView=()=> {
  return (
    <>
      <Container>
        <Typography variant="h3" sx={{ mb: 2 }}>
          This worked for next time!
        </Typography>

        <Typography sx={{ color: 'text.secondary' }}>
          You can navigate back or try a different page.
        </Typography>

        <Box
          component="img"
          src={NotFoundImage}
          sx={{
            width: 320,
            height: 'auto',
            my: { xs: 5, sm: 10 },
          }}
        />

        <Button component={RouterLink} href="/dashboard/default" size="large" variant="contained" color="inherit">
          Go to home
        </Button>
      </Container>
      </>
  );
}
export default NotFoundView;