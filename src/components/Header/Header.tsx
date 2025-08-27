import { Header as CommonHeader } from '@pagopa/selfcare-common-frontend/lib';
// import { User } from '@pagopa/selfcare-common-frontend/lib';
import { useAuth } from '../../contexts/AuthContext';

type Props = {
  withSecondHeader: boolean;
};

const Header = ({ withSecondHeader }: /* , parties */ Props) => {

  const { user }: any = useAuth();
  console.log("USER", user)

  return (
    <CommonHeader
      onExit={() => {}}
      withSecondHeader={withSecondHeader}
      loggedUser={
        user
          ? {
              id: user ? user.id : '',
              name: user?.username,
              surname: user?.lastName,
              email: user?.email,
            }
          : false
      }
      enableLogin={false}
    />
  );
};
export default Header;
