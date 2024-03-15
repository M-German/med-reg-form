import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

const theme = createTheme({
  palette: {
    background: {
      default: "#fafafa",
      paper: "#fff"
    },
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: red.A200,
    },
  },
  transitions: {
    duration: {
      enteringScreen: 400,
      leavingScreen: 400,
    }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: "16px"
        }
      }
    }
  }
});

export default theme;