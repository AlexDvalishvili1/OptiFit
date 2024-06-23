import './Program.css';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import Button from "@/components/Button";
import {styled} from '@mui/system';
import Colors from "@/app/colors";

const StyledDialog = styled(Dialog)(({theme}) => ({
    '& .MuiPaper-root': {
        backgroundColor: Colors.color,
        padding: theme.spacing(1),
    },
}));

const StyledDialogTitle = styled(DialogTitle)(({theme}) => ({
    fontFamily: 'Outfit, sans-serif',
    fontSize: '1.5rem',
    fontWeight: 'bold',
}));

const Confirmation = ({setConfirmation, confirmation, onAgree, title}) => {
    return (
        <StyledDialog
            open={confirmation}
            aria-labelledby="alert-dialog-title"
        >
            <StyledDialogTitle id="alert-dialog-title">
                {title}
            </StyledDialogTitle>
            <DialogActions>
                <Button variant={Colors.styles.red} onClick={() => {
                    setConfirmation(false)
                }}>Disagree</Button>
                <Button variant={Colors.styles.green} onClick={() => {
                    onAgree()
                }} autoFocus>
                    Agree
                </Button>
            </DialogActions>
        </StyledDialog>
    );
};

export default Confirmation;
