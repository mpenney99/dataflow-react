import React, { useEffect } from 'react';
import clsx from 'clsx';

export type Option = string | { key: string, label: string };

type Props = {
    value: string;
    options: Option[];
    className?: string;
    onChange: (value: string) => void;
}

function getOptionValue(opt: Option) {
    return typeof opt === 'string' ? opt : opt.key;
}

export default function SelectInput({ value, options, className, onChange }: Props) {

    useEffect(() => {
        if (options.length && !options.some((opt) => getOptionValue(opt) === value)) {
            onChange(getOptionValue(options[0]));
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange(e.target.value);
    }

    return (
        <select
            value={value}
            onChange={handleChange}
            className={clsx("ngr-field-input", className)}
        >
            {options.map((opt, i) => {
                let label: string;
                let key: string;

                if (typeof opt === 'string') {
                    label = key = opt;
                } else {
                    label = opt.label;
                    key = opt.key;
                }

                return <option key={i} value={key}>{label}</option>;
            })}
        </select>
    );
}
