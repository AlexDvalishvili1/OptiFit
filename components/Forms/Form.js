const Form = ({getFormData, title, style, children}) => {
    return (
        <div className="form__container">
            <div className={"form__title"}>{title}</div>
            <form onSubmit={getFormData} style={style ? style : {}} noValidate>
                {children}
            </form>
        </div>
    );
};

export default Form;