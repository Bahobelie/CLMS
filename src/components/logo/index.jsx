import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// material-ui
import { ButtonBase } from '@mui/material';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';

// project import
import Logo from './LogoMain';
import config from 'config';

// ==============================|| MAIN LOGO ||============================== //

const LogoSection = ({ sx, to }) => {
  return (
    <ButtonBase
      disableRipple
      component={Link}
      to={!to ? config.defaultPath : to}
      sx={{
        padding: '8px 16px',
        borderRadius: '12px',
        transition: 'background-color 0.3s ease', // Smooth hover transition
        ...sx, // Merge additional styles passed via sx prop
      }}
    >
      <Stack direction="row" spacing={-.10} alignItems="center">
        <Logo />
        <Chip
          label="TW-CLMS"
          sx={{
            alignItems: 'center',
            fontWeight: 'bold',
            backgroundColor: '#07B8DB',
            color: 'white',
            padding: '2px 10px',
            borderRadius: '8px',
          }}
        />
      </Stack>
    </ButtonBase>
  );
};

LogoSection.propTypes = {
  sx: PropTypes.object,
  to: PropTypes.string
};

export default LogoSection;
