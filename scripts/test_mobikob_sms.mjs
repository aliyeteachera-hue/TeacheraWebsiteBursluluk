import { getSmsBalance, querySmsStatus, sendSms } from '../api/_lib/smsProvider.js';

function readArgs(argv) {
  const [, , mode = 'balance', value = ''] = argv;
  return {
    mode,
    value,
  };
}

async function main() {
  const { mode, value } = readArgs(process.argv);

  if (mode === 'balance') {
    const balance = await getSmsBalance();
    console.log(JSON.stringify({ ok: true, mode, balance: balance.balance }, null, 2));
    return;
  }

  if (mode === 'send') {
    if (!value) {
      throw new Error('missing_phone');
    }

    const result = await sendSms({
      to: value,
      msg: 'Teachera bursluluk SMS testi. Bu bir test mesajidir.',
    });

    console.log(
      JSON.stringify(
        {
          ok: true,
          mode,
          status: result.status,
          messageId: result.messageId,
          to: result.to,
        },
        null,
        2,
      ),
    );
    return;
  }

  if (mode === 'status') {
    if (!value) {
      throw new Error('missing_message_id');
    }

    const result = await querySmsStatus(value);
    console.log(
      JSON.stringify(
        {
          ok: true,
          mode,
          status: result.status,
          messageId: result.messageId,
          sentAt: result.sentAt,
        },
        null,
        2,
      ),
    );
    return;
  }

  throw new Error(`unsupported_mode:${mode}`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : 'unknown_error';
  console.error(JSON.stringify({ ok: false, error: message }, null, 2));
  process.exitCode = 1;
});
