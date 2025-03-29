import { Rating as StarRating } from 'react-simple-star-rating';
import styles from './styles.module.css';

interface RatingProps {
    value: number;
    onChange: (value: number) => void;
    readonly?: boolean;
    allowFraction?: boolean;
    showTooltip?: boolean;
}

export default function Rating({
    value,
    onChange,
    readonly = false,
    allowFraction = true,
    showTooltip = true
}: RatingProps) {
    return (
        <div className={styles.ratingContainer}>
            <StarRating
                onClick={onChange}
                initialValue={value}
                transition={true}
                readonly={readonly}
                allowFraction={allowFraction}
                showTooltip={showTooltip}
                fillColorArray={['#f17a45', '#f19745', '#f1a545', '#f1b345', '#f1d045']}
                className={styles['star-svg']}
            />
        </div>
    );
} 