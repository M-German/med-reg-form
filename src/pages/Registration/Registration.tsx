import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { useEffect, useRef, useState } from 'react';
import Gender from '@/types/Gender';
import Doctor from '@/types/Doctor';
import ClientGroup from '@/types/ClientGroup';
import gendersList from '@/data/genders';
import doctorsList from '@/data/doctors';
import clientGroupsList from '@/data/clientGroups';
import {CircularProgress, Slide } from '@mui/material';
import RegistrationForm from '@/components/RegistrationForm';
import RegistrationSuccess from '@/components/RegistrationSuccess';
import { TransitionGroup } from 'react-transition-group';

export default function Registration() {
    const boxRef = useRef<HTMLElement>(null);
    const [loading, setLoading] = useState(true);
    const [genders, setGenders] = useState<Gender[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [clientGroups, setClientGroups] = useState<ClientGroup[]>([]);
    const [registered, setRegistered] = useState(false);

    useEffect(() => {
        setGenders(gendersList);
        setDoctors(doctorsList);
        setClientGroups(clientGroupsList);

        // sumulate async data fetching
        setTimeout(() => {
            setLoading(false);
        }, 2000)
    }, []);

    const handleRegister = () => {
        setRegistered(true);
    }

    const handleReturn = () => {
        setRegistered(false);
    }

    return (
        <Container maxWidth="sm">
            <TransitionGroup style={{position: "relative"}}>
                {!registered && 
                <Slide appear={false} direction='right'>
                    <div className='registration__slider_container'>
                        {loading && <LoadingIndicator />}
                        <Slide in={!loading} appear={false} container={boxRef.current}>
                            <RegistrationForm 
                                doctors={doctors}
                                clientGroups={clientGroups}
                                genders={genders}
                                onRegister={handleRegister}
                            />
                        </Slide>
                    </div>
                </Slide>}
                {registered && 
                <Slide direction='left'>
                    <div className='registration__slider_container'>
                        <RegistrationSuccess onReturn={handleReturn} />
                    </div>
                </Slide>}
            </TransitionGroup>
        </Container>
    )
}

const LoadingIndicator = () => (
    <Box 
        position="absolute"
        display="flex"
        width="100%" height="100%"
        justifyContent="center"
        alignItems="center"
    >
        <CircularProgress />
    </Box>
)