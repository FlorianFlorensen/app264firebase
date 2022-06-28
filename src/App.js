import './App.css';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Login from "./Components/Login/Login";
import Dashboard from "./Components/Dashboard/Dashboard";
import {useAuthState} from "react-firebase-hooks/auth";
import {auth} from "./firebase";

export default function App() {
    const [user] = useAuthState(auth);

    //TODO : Login Screen flashed for 1 second, fix it
    if (!user) {
        return <Login/>;
    } else {
        return (
            <div className="App">
                <BrowserRouter>
                    <Routes>
                        <Route exact path="/" element={<Dashboard/>}/>
                    </Routes>
                </BrowserRouter>
            </div>
        );
    }
}

