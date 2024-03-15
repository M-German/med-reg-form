import { Box, IconButton, Paper, Typography } from "@mui/material";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface Props {
    onReturn: () => void;
}

export const RegistrationSuccess: React.FC<Props> = ({onReturn}) => {
    return (
        <Paper className="registration__register_success">
            <CheckCircleOutlineIcon className="registration__register_success__logo" color="success" />
            <Box className="registration__register_success__text">
                <Typography variant="h5">
                    Спасибо за регистрацию!
                </Typography>
                <Typography variant="body1">
                    Ваши данные находятся на обработке
                </Typography>
            </Box>
            <Box alignSelf="center">
                <IconButton onClick={onReturn}>
                    <ArrowForwardIcon fontSize="large" />
                </IconButton>
            </Box>
        </Paper>
    )
};

export default RegistrationSuccess;