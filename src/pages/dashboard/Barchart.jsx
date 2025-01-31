import { useEffect, useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';

// third-party
import ReactApexChart from 'react-apexcharts';

// chart options
const getBarChartOptions = (barColor) => ({
  chart: {
    type: 'bar',
    height: 300,
    toolbar: {
      show: false
    }
  },
  dataLabels: {
    enabled: false
  },
  xaxis: {
    categories: ['Sep', 'Oct', 'Nuv', 'Jan', 'Feb', 'Mar', 'Ap'],
    labels: {
      show: false
    },
    axisBorder: {
      show: false
    },
    axisTicks: {
      show: false
    }
  },
  yaxis: {
    show: false
  },
  grid: {
    show: false
  },
  colors: [barColor] // Set bar color dynamically
});

// ==============================|| MONTHLY BAR CHART ||============================== //

// eslint-disable-next-line react/prop-types
export default function BarChart({ barColor = '#00bcd4', data = [] }) {
  const theme = useTheme();

  const [Data] = useState([
    {
      data: [...data]
    }
  ]);

  const [options, setOptions] = useState(getBarChartOptions(barColor));

  useEffect(() => {
    setOptions(getBarChartOptions(barColor));
  }, [barColor]);

  return (
    <Grid container direction="row" alignItems="center" justifyContent='center' spacing={2}>
      <Grid item>
        <Box
          id="chart"
          sx={{
            bgcolor: theme.palette.secondary[100],
            borderRadius: '12px',
          }}
        >
          <ReactApexChart options={options} series={Data} type="bar" width="100%" height="90" />
        </Box>
      </Grid>
    </Grid>
  );
}