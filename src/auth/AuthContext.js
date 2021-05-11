import React, { createContext, useCallback, useContext, useState } from "react";
import { ChatContext } from "../context/chat/ChatContext";
import { fetchConToken, fetchSinToken } from "../helpers/fetch";
import { types } from "../types/types";

export const AuthContext = createContext();

const initialState = {
    uid: null,
    checking: true,
    logged: false,
    name: null,
    email: null
};


export const AuthProvider = ({ children }) => {

    const [ auth, setAuth ] = useState( initialState );
    const { dispatch } = useContext( ChatContext );

    const login = async( email, password ) => {
        const res = await fetchSinToken('login', { email, password }, 'POST');
    
        if ( res.ok ) {
            localStorage.setItem('token', res.token );
            const { usuario } = res;

            setAuth({
                uid: usuario.uid,
                checking: false,
                logged: true,
                name: usuario.nombre,
                email: usuario.email
            });
        }

        return res.ok;
    }

    const register = async( nombre, email, password ) => {
        const res = await fetchSinToken('login/new', { nombre, email, password }, 'POST');
    
        if ( res.ok ) {
            localStorage.setItem('token', res.token );
            const { usuario } = res;

            setAuth({
                uid: usuario.uid,
                checking: false,
                logged: true,
                name: usuario.nombre,
                email: usuario.email
            });

            return true;
        }

        return res.msg;
    }

    const verificaToken = useCallback( async() => {

        const token = localStorage.getItem('token');

        if ( !token ) {
            setAuth({
                checking: false,
                logged: false
            });

            return false;
        }

        const res = await fetchConToken('login/renew');

        if ( res.ok ) {
            localStorage.setItem('token', res.token );
            const { usuario } = res;

            setAuth({
                uid: usuario.uid,
                checking: false,
                logged: true,
                name: usuario.nombre,
                email: usuario.email
            });

            return true;
        } else {
            setAuth({
                checking: false,
                logged: false
            });

            return false;
        }

    }, []);

    const logout = () => {
        localStorage.removeItem('token');

        dispatch({ type: types.cerrarSesion });

        setAuth({
            checking: false,
            logged: false
        });
    }

    return (
        <AuthContext.Provider value={{
            auth,
            login,
            register,
            verificaToken,
            logout
        }}>
            { children }
        </AuthContext.Provider>
    )
}
