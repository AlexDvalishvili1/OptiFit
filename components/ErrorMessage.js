import {MdError, MdCheckCircle} from 'react-icons/md';
import Colors from "../app/colors";

const ErrorMessage = ({message, padding, justifyContent, success, style}) => {
    const color = `${success ? "#00ff00" : Colors.errorRed}`;
    return (
        <>
            {message &&
                <p style={{
                    color: color,
                    display: "flex",
                    justifyContent,
                    alignItems: "center",
                    gap: 5,
                    padding: `${padding}`,
                    ...style,
                }}>{success ? <MdCheckCircle color={color}/> : <MdError color={color}/>}{message}</p>
            }
        </>
    );
};

export default ErrorMessage;