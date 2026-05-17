Set-Location $PSScriptRoot\..\backend
python -m pip install -r requirements.txt -q 2>$null
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
