// import { useEffect, useRef, useState } from "react";
// import { useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { googleAuthLogin } from "../redux/slices/authSlice";
// import useToast from "../hooks/useToast";

// const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// let scriptLoadingPromise = null;
// const loadGoogleScript = () => {
//   if (window.google?.accounts?.id) return Promise.resolve();
//   if (scriptLoadingPromise) return scriptLoadingPromise;

//   scriptLoadingPromise = new Promise((resolve, reject) => {
//     const script = document.createElement("script");
//     script.src = "https://accounts.google.com/gsi/client";
//     script.async = true;
//     script.defer = true;
//     script.onload = resolve;
//     script.onerror = reject;
//     document.head.appendChild(script);
//   });

//   return scriptLoadingPromise;
// };

// export default function GoogleAuthButton() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const toast = useToast();
//   const buttonRef = useRef(null);
//   const [ready, setReady] = useState(false);

//   useEffect(() => {
//     let cancelled = false;

//     if (!GOOGLE_CLIENT_ID) return;

//     loadGoogleScript()
//       .then(() => {
//         if (cancelled || !window.google?.accounts?.id) return;

//         window.google.accounts.id.initialize({
//           client_id: GOOGLE_CLIENT_ID,
//           callback: async ({ credential }) => {
//             const result = await dispatch(googleAuthLogin(credential));
//             if (googleAuthLogin.fulfilled.match(result)) {
//               toast.success("Signed in with Google!");
//               navigate("/dashboard", { replace: true });
//             } else {
//               toast.error(result.payload || "Google sign-in failed");
//             }
//           },
//         });

//         if (buttonRef.current) {
//           window.google.accounts.id.renderButton(buttonRef.current, {
//             theme: "outline",
//             size: "large",
//             width: 336,
//             text: "continue_with",
//             shape: "rectangular",
//             logo_alignment: "left",
//           });
//         }
//         setReady(true);
//       })
//       .catch(() => {
//         // silently ignore — button just won't render
//       });

//     return () => {
//       cancelled = true;
//     };
//   }, [dispatch, navigate, toast]);

//   if (!GOOGLE_CLIENT_ID) return null;

//   return (
//     <div className="flex justify-center">
//       <div ref={buttonRef} className={ready ? "" : "hidden"} />
//       {!ready && (
//         <button type="button" disabled className="btn-secondary w-full opacity-60">
//           Continue with Google
//         </button>
//       )}
//     </div>
//   );
// }
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { googleAuthLogin } from "../redux/slices/authSlice";
import useToast from "../hooks/useToast";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

let scriptLoadingPromise = null;
let googleInitialized = false; // ✅ Global flag

const loadGoogleScript = () => {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (scriptLoadingPromise) return scriptLoadingPromise;

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
};

export default function GoogleAuthButton() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const buttonRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!GOOGLE_CLIENT_ID) return;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !window.google?.accounts?.id) return;

        // ✅ Initialize only once
        if (!googleInitialized) {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: async ({ credential }) => {
              const result = await dispatch(googleAuthLogin(credential));

              if (googleAuthLogin.fulfilled.match(result)) {
                toast.success("Signed in with Google!");
                navigate("/dashboard", { replace: true });
              } else {
                toast.error(result.payload || "Google sign-in failed");
              }
            },
          });

          googleInitialized = true;
        }

        // ✅ Clear previous button before rendering again
        if (buttonRef.current) {
          buttonRef.current.innerHTML = "";

          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: "outline",
            size: "large",
            width: 336,
            text: "continue_with",
            shape: "rectangular",
            logo_alignment: "left",
          });
        }

        setReady(true);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []); // ✅ Run only once

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <div className="flex justify-center">
      <div ref={buttonRef} className={ready ? "" : "hidden"} />

      {!ready && (
        <button
          type="button"
          disabled
          className="btn-secondary w-full opacity-60"
        >
          Continue with Google
        </button>
      )}
    </div>
  );
}