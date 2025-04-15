import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import ClearOutlined from '@ant-design/icons/ClearOutlined'; // Clear icon for professional UI

export default function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Update searchTerm from URL query params when the component mounts or URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('search') || '';
    setSearchTerm(query);
  }, [location.search]);

  // Handle search when Enter key is pressed or search icon is clicked
  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/patients?search=${searchTerm}`);
    }
  };

  // Clear search input and URL query
  const clearSearch = () => {
    setSearchTerm('');
    navigate('/patients');
  };

  return (
    <Box sx={{ width: '100%', ml: { xs: 0, md: 1 } }}>
      <FormControl sx={{ width: { xs: '100%', md: 224 } }}>
        <OutlinedInput
          size="small"
          id="header-search"
          startAdornment={
            <InputAdornment position="start" sx={{ mr: -0.5 }}>
              <SearchOutlined
                onClick={handleSearch}
                style={{ cursor: 'pointer', transition: '0.3s' }}
              />
            </InputAdornment>
          }
          endAdornment={
            searchTerm && (
              <InputAdornment position="end">
                <IconButton onClick={clearSearch} edge="end">
                  <ClearOutlined />
                </IconButton>
              </InputAdornment>
            )
          }
          aria-describedby="header-search-text"
          inputProps={{
            'aria-label': 'Search patients'
          }}
          placeholder="Search Patients"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
      </FormControl>
    </Box>
  );
}
