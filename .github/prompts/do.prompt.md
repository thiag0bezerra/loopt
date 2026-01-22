---
agent: agent
tools:
  [
    'execute',
    'read',
    'edit',
    'web',
    'io.github.upstash/context7/*',
    'agent',
    'todo',
  ]
---

Este projeto consiste de um monorepo com backend Nestjs e frontend Nextjs, seguindo os requisitos técnicos e entregáveis especificados no arquivo [todo/TODO.md](../../todo/TODO.md).
Use a tool #tool:io.github.upstash/context7/resolve-library-id e #tool:io.github.upstash/context7/get-library-docs para consultar a documentação oficial.
Use a tool #tool:todo para planejar/criar/ler suas tarefas.
Faça apenas o que foi pedido e siga fielmente as instruções.
Não insista no erro: pare e peça orientações se não conseguir progredir.
Se existe um meio oficial de fazer algo, use-o.
Não adicione código ou funcionalidades extras que não foram solicitadas.
Antes de começar, descreva brevemente seu plano para completar a tarefa.
Jamais utilize diretivas para ignorar erros ou falhas de compilação.
Jamais utilize double casting (ex: value as unknown as Type).
Jamais utilize "any" em TypeScript.
Restrinja-se ao que pede [todo/TODO.md](../../todo/TODO.md).
Prefira o simples ao complexo. Prefira soluções diretas e óbvias.
Documente e mantenha o código atualizado através de comentários TSDoc.
Se completou alguma checkbox em [todo/TODO.md](../../todo/TODO.md), atualize o arquivo imediatamente.
Antes de começar, consulte a documentação oficial das ferramentas necessárias para entender como fazer isso e configurar corretamente. Leve em consideração a versão específica do framework/biblioteca usada no projeto.
Prefira criar apps do monorepo através de ferramentas oficiais (ex: Nestjs CLI, Nextjs CLI, Nx CLI) ao invés de criar manualmente.

## Como executar comandos

## 1. Environment Constraints

- **Shell:** PowerShell (Core/Desktop).
- **Concurrency:** Single-threaded CLI session.
- **Blocking Behavior:** Executing long-running processes (e.g., `npm start`, `pnpm dev`, `python server.py`) in the foreground is **STRICTLY PROHIBITED** as it renders the terminal unresponsive to further agent commands.

---

## 2. Parallel Execution Protocol

To run simultaneous tasks (e.g., running a server while executing tests), the Agent **MUST** utilize PowerShell Jobs.

### Required Pattern: "Job-Wait-Interact"

Use the following syntax structure to orchestrate background processes safely.

#### Step 1: Start Background Process

Always define the `WorkingDirectory`.

```powershell
$serverJob = Start-Job -ScriptBlock { pnpm dev } -WorkingDirectory (Get-Location)

```

#### Step 2: Initialization Buffer

Allow the process time to initialize before probing.

```powershell
Start-Sleep -Seconds 5

```

#### Step 3: Perform Parallel Action

Execute the secondary command in the now-free terminal.

```powershell
# Example: Health check logic
curl -I http://localhost:3000/health

```

#### Step 4: Validate Background Output

Check logs without destroying the job context.

```powershell
# Check status
Get-Job -Id $serverJob.Id

# Read logs (stdout/stderr)
Receive-Job -Id $serverJob.Id -Keep

```

#### Step 5: Cleanup

When the session goal is met, kill the background process to free resources.

```powershell
Stop-Job -Id $serverJob.Id
Remove-Job -Id $serverJob.Id

```

---

## 3. Common Commands (Reference)

| Action               | Command Pattern                                         |
| -------------------- | ------------------------------------------------------- |
| **Start Dev Server** | `Start-Job -ScriptBlock { pnpm dev } ...`               |
| **Run Tests**        | `npm test` (Foreground allowed if short)                |
| **Check Port**       | `Test-NetConnection -ComputerName localhost -Port 3000` |
| **List Jobs**        | `Get-Job`                                               |

## 4. Failure Recovery

If a command hangs or the Agent loses context of a job:

1. Run `Get-Job` to identify orphaned processes.
2. Run `Get-Process node | Stop-Process` (or equivalent) if a force kill is required.
