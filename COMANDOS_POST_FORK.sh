# 🚀 Comandos para Ejecutar DESPUÉS de hacer Fork

# ⚠️ IMPORTANTE: Ejecuta estos comandos solo DESPUÉS de completar el fork en GitHub

# 1. Agregar tu fork como nuevo remote
git remote add my-fork https://github.com/Elver581/eco-reciclaje.git

# 2. Verificar que el remote se agregó correctamente
git remote -v

# 3. Push a tu fork
git push my-fork chore/revision-general

# 4. (Opcional) Cambiar el origin a tu fork si quieres trabajar principalmente en tu fork
# git remote set-url origin https://github.com/Elver581/eco-reciclaje.git

# 5. (Opcional) Mantener el original como upstream para futuras actualizaciones
# git remote add upstream https://github.com/wyl-dev/eco-reciclaje.git

# 6. Verificar el estado final
git remote -v
git log --oneline -3

echo "✅ Fork y push completados exitosamente!"
