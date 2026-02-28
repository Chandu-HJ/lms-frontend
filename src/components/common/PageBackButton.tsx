import { useNavigate } from 'react-router-dom';
import './PageBackButton.css';

interface PageBackButtonProps {
  fallbackPath: string;
}

const PageBackButton = ({ fallbackPath }: PageBackButtonProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(fallbackPath, { replace: true });
  };

  return (
    <button type="button" className="pageBackButton" onClick={handleBack}>
      Back
    </button>
  );
};

export default PageBackButton;
