import logo from 'src/assets/images/auth/logo.png';

// ==============================|| LOGO SVG ||============================== //
const Logo = () => {

  return (
    <>
      <img
        style={{ width: '97px',marginTop:'13px' }}
        src={logo}
        alt="logo"
        className="logo"
      />

    </>
  );
};

export default Logo;
