import './ToggleSwitch.css';

const ToggleSwitch = ({ isOn, onToggle, id }) => {
    const handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("DEBUG: ToggleSwitch clicked for id", id, "new status will be", !isOn);
        onToggle(!isOn);
    };

    return (
        <div
            className="toggle-switch"
            onClick={handleClick}
            style={{ cursor: 'pointer' }}
        >
            <input
                type="checkbox"
                id={id}
                checked={isOn}
                readOnly
                style={{ display: 'none' }}
            />
            <span className="toggle-slider">
                <span className="toggle-label-yes">YES</span>
                <span className="toggle-label-no">NO</span>
            </span>
        </div>
    );
};

export default ToggleSwitch;
