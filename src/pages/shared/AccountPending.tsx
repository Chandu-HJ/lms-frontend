import { useNavigate } from 'react-router-dom';
import { clearSessionUser, getSessionUser } from '../../utils/authSession';
import './AccountPending.css';

const AccountPending = () => {
  const navigate = useNavigate();
  const sessionUser = getSessionUser();
  const accountStatus = sessionUser?.status;

  const statusHeading =
    accountStatus === 'PENDING'
      ? 'Account Status: Pending'
      : accountStatus === 'DEACTIVE'
        ? 'Account Status: Deactivated'
        : 'Account Not Active';

  const statusMessage =
    accountStatus === 'PENDING'
      ? 'Status is pending. It needs to be approved/updated by admin.'
      : accountStatus === 'DEACTIVE'
        ? 'Account is deactivated by admin.'
        : `${sessionUser?.role ?? 'Your'} account is not active yet. Please contact admin.`;

  return (
    <section className="pendingWrap">
      <div className="pendingCard">
        <h2>{statusHeading}</h2>
        <p>{statusMessage}</p>
        <button
          type="button"
          onClick={() => {
            clearSessionUser();
            navigate('/login', { replace: true });
          }}
        >
          Back to Login
        </button>
      </div>
    </section>
  );
};

export default AccountPending;
