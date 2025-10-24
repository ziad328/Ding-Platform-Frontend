import { useSelector } from "react-redux";
import { selectCurrentToken, selectCurrentUser, setCredentials } from "../store/slices/auth/auth";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";


export const IsAuth = () => {
  const Token = useSelector(selectCurrentToken);
  const User = useSelector(selectCurrentUser);

  return Token && User ? true : false;
}
export const NavigationHandler = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const URLtoken = queryParams.get('token');
    const URLuserParam = queryParams.get('user');
    
    try {
      const token = decodeURIComponent(URLtoken || '');
      const userParam = decodeURIComponent(URLuserParam || '');
  
      const user = userParam ? JSON.parse(userParam) : {};
      if (token) {
        dispatch(setCredentials({ token: token, user }));
        enqueueSnackbar('Login successful!', { variant: 'success' });
        navigate('/');
      }
    } catch (error) {
      enqueueSnackbar('Login failed!', { variant: 'error' });
    }
  }, [dispatch, navigate]);

  return null;
}
export const useAuth = () => {
  const Token = useSelector(selectCurrentToken);
  const User = useSelector(selectCurrentUser);

  return { Token, User, isAuthed: Token && User ? true : false };
}