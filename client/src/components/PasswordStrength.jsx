import { useState, useEffect } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const strengthLabels = ["weak", "weak", "medium", "medium", "strong"];

const PasswordStrength = ({ placeholder, id, value, onChange, disabled, required = true, showStrength = true }) => {
    const [strength, setStrength] = useState("");
    const [visible, setVisible] = useState(false);

    const getStrength = (password) => {
        if (!password) return "";
        let strengthIndicator = -1;

        if (/[a-z]/.test(password))
            strengthIndicator++;
        if (/[A-Z]/.test(password))
            strengthIndicator++;
        if (/\d/.test(password))
            strengthIndicator++;
        if (/[^a-zA-Z0-9]/.test(password))
            strengthIndicator++;
        if (password.length >= 16)
            strengthIndicator++;

        return strengthLabels[strengthIndicator] || "weak";
    };

    const handleChange = (event) => {
        onChange(event.target.value);
    };

    useEffect(() => {
        setStrength(getStrength(value));
    }, [value]);

    return (
        <>
            <style>{`
                .textbox {
                    position: relative;
                    width: 100%;
                }
                .textbox input.password-strength {
                    width: 100%;
                    padding: 20px 44px 6px 12px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    color: #fff;
                    font-family: 'Inter', sans-serif;
                    font-size: 14px;
                    transition: 0.3s ease;
                    outline: none;
                }
                .textbox input.password-strength:focus {
                    border-color: #6c5ce7;
                    background: rgba(255, 255, 255, 0.06);
                    box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.2);
                }
                .textbox label {
                    position: absolute;
                    top: 50%;
                    left: 12px;
                    translate: 0 -50%;
                    transform-origin: 0 50%;
                    pointer-events: none;
                    color: #a0a0b0;
                    font-family: 'Inter', sans-serif;
                    font-size: 14px;
                    transition: 0.3s ease;
                }
                .textbox input.password-strength:is(:focus, :not(:placeholder-shown)) ~ label {
                    scale: 0.725;
                    translate: 0 -112%;
                }
                .toggle-visibility {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    translate: 0 -50%;
                    height: auto;
                    padding: 6px;
                    background: transparent;
                    border: none;
                    border-radius: 4px;
                    color: #a0a0b0;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: color 0.15s ease;
                }
                .toggle-visibility:hover {
                    color: #fff;
                }
                .bars-container {
                    margin-top: 8px;
                    margin-bottom: 4px;
                    width: 100%;
                }
                .bars {
                    flex: 1 1 auto;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    height: 4px;
                    border-radius: 3px;
                    background: rgba(255, 255, 255, 0.1);
                    overflow: hidden;
                }
                .bars div {
                    height: 100%;
                    width: 0%;
                    border-radius: 3px;
                    transition: 0.3s ease-out;
                }
                .bars.weak div {
                    background: #ef4444;
                    width: 33.33%;
                }
                .bars.medium div {
                    background: #f59e0b;
                    width: 66.66%;
                }
                .bars.strong div {
                    background: #34d399;
                    width: 100%;
                }
                .strength {
                    text-align: left;
                    height: 16px;
                    font-size: 11px;
                    text-transform: capitalize;
                    color: #a0a0b0;
                    margin-top: 4px;
                    font-family: 'Inter', sans-serif;
                }
            `}</style>

            <div className="textbox">
                <input
                    id={id}
                    name="password"
                    spellCheck="false"
                    className="password-strength"
                    placeholder=" "
                    type={visible ? "text" : "password"}
                    value={value || ""}
                    onChange={handleChange}
                    disabled={disabled}
                    required={required}
                />
                <label htmlFor={id}>{placeholder}</label>
                <button
                    type="button"
                    className="toggle-visibility"
                    onClick={() => setVisible((v) => !v)}
                    disabled={disabled}
                >
                    {visible ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
            </div>
            {showStrength && (
                <div className="bars-container">
                    <div className={`bars ${strength}`}>
                        <div></div>
                    </div>
                    <div className="strength">
                        {strength && `${strength} password`}
                    </div>
                </div>
            )}
        </>
    );
};

export default PasswordStrength;
