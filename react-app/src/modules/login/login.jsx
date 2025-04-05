import { useState } from "react";
import supabase from "../../core/config/supabase-client";
import { useNavigate } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import { FaThermometer, FaThermometerFull } from "react-icons/fa";

const Login = () => {
  const form = useForm();

  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Estado de carga

  const handleSubmit = async (formData) => {
    setMessage("");
    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    setIsLoading(false);
    if (error) {
      setMessage(error.message);
      return null;
    }

    if (data) {
      navigate("/");
      return null;
    }

    setPassword("");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen pb-20">
      <div className="text-center mb-4 flex items-center justify-center text-lg font-bold">
        <FaThermometerFull className="text-6xl text-orange-400 mb-4" />
        Control de Temperatura y Humedad
      </div>
      <h2 className="text-2xl font-bold mb-4">Iniciar Sesión</h2>
      {message && <p>{message}</p>}
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="md:w-1/4">
          {/* <EmailField
            label="Email"
            inputName="email"
            placeholder="Ingresa tu email"
          /> */}
          <input
            type="email"
            {...form.register("email", { required: true })}
            className="w-full p-2 border border-gray-300 rounded mb-4"
            placeholder="Ingresa tu email"
          />
          {/* <PasswordTextField
            label="Contraseña"
            inputName="password"
            placeholder="Ingresa tu contraseña"
            password={password}
            setPassword={setPassword}
          /> */}
          <input
            type="password"
            {...form.register("password", { required: true })}
            className="w-full p-2 border border-gray-300 rounded mb-4"
            placeholder="Ingresa tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex justify-center mt-5">
            {/* <Button type="submit" disabled={isLoading}>
              {isLoading ? "Cargando..." : "Iniciar Sesión"}
            </Button> */}

            <button type="submit" className="ml-4 bg-slate-500 text-white px-4 py-2 rounded">
              {isLoading ? "Cargando..." : "Iniciar Sesión"}
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default Login;
