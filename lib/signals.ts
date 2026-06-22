import { Signal } from '@/types';

const PT_TLDS = new Set(['pt']);

const STRONG_DOMAIN_KEYWORDS = ['fisio', 'reabilit', 'apfisio'];
const MODERATE_DOMAIN_KEYWORDS = ['sns', 'saude', 'hospital', 'clinica', 'misericordia', 'inem'];
const INSTITUTION_DOMAINS = [
  'chsj', 'chuc', 'chl', 'chln', 'ulsna', 'chbv',
  'hff', 'chlc', 'chba', 'ulsam', 'chvnge',
];
const STRONG_USERNAME_KEYWORDS = ['fisio', 'physio', 'terapeuta', 'reabilit'];

const PORTUGUESE_SURNAMES = new Set([
  'silva', 'santos', 'ferreira', 'pereira', 'oliveira', 'costa',
  'rodrigues', 'martins', 'jesus', 'sousa', 'fernandes', 'goncalves',
  'gomes', 'lopes', 'marques', 'alves', 'almeida', 'carvalho',
  'leite', 'pinto', 'nunes', 'ribeiro', 'cunha', 'tavares', 'teixeira',
]);

const PORTUGUESE_FIRST_NAMES = new Set([
  'joao', 'maria', 'ana', 'pedro', 'jose', 'luis', 'paulo', 'filipe',
  'ricardo', 'miguel', 'carlos', 'fernando', 'antonio', 'sofia',
  'catarina', 'ines', 'marta', 'beatriz', 'rui', 'hugo', 'diogo',
  'tiago', 'andre', 'bruno', 'david', 'goncalo', 'manuel', 'francisco',
  'sandra', 'paula',
]);

function normalise(str: string): string {
  return str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function parseEmail(email: string): { username: string; domainBody: string; tld: string } | null {
  try {
    const atIdx = email.lastIndexOf('@');
    if (atIdx < 0) return null;
    const username = email.slice(0, atIdx).toLowerCase();
    const domainFull = email.slice(atIdx + 1).toLowerCase();
    const lastDot = domainFull.lastIndexOf('.');
    if (lastDot < 0) return null;
    const tld = domainFull.slice(lastDot + 1);
    const domainBody = domainFull.slice(0, lastDot);
    return { username, domainBody, tld };
  } catch {
    return null;
  }
}

export function extractSignals(name: string, email: string): Signal[] {
  const signals: Signal[] = [];
  const parsed = parseEmail(email);

  if (parsed) {
    const { username, domainBody, tld } = parsed;
    const fullDomain = `${domainBody}.${tld}`;

    // 1. TLD check
    if (PT_TLDS.has(tld)) {
      signals.push({
        factor: 'Portuguese TLD (.pt)',
        impact: 'positive',
        strength: 'strong',
        rawValue: `.${tld}`,
        explanation: 'The .pt top-level domain is exclusively registered in Portugal, strongly suggesting a Portuguese origin.',
        category: 'email-tld',
      });
    }

    // 2. Institution domain check
    const matchedInstitution = INSTITUTION_DOMAINS.find(inst => fullDomain.includes(inst));
    if (matchedInstitution) {
      signals.push({
        factor: 'Portuguese health institution domain',
        impact: 'positive',
        strength: 'strong',
        rawValue: fullDomain,
        explanation: `The domain contains "${matchedInstitution}", which matches a known Portuguese public health institution.`,
        category: 'email-domain',
      });
    }

    // 3. Domain keyword check (one signal, strongest wins)
    const strongDomainHit = STRONG_DOMAIN_KEYWORDS.find(kw => fullDomain.includes(kw));
    if (strongDomainHit) {
      signals.push({
        factor: 'Physiotherapy keyword in email domain',
        impact: 'positive',
        strength: 'strong',
        rawValue: fullDomain,
        explanation: `The domain contains "${strongDomainHit}", a term directly associated with physiotherapy or rehabilitation.`,
        category: 'email-domain',
      });
    } else {
      const moderateDomainHit = MODERATE_DOMAIN_KEYWORDS.find(kw => fullDomain.includes(kw));
      if (moderateDomainHit) {
        signals.push({
          factor: 'Healthcare keyword in email domain',
          impact: 'positive',
          strength: 'moderate',
          rawValue: fullDomain,
          explanation: `The domain contains "${moderateDomainHit}", associated with healthcare organisations in Portugal.`,
          category: 'email-domain',
        });
      }
    }

    // 4. Username keyword check
    const usernameNorm = normalise(username);
    const usernameHit = STRONG_USERNAME_KEYWORDS.find(kw => usernameNorm.includes(kw));
    if (usernameHit) {
      signals.push({
        factor: 'Physiotherapy keyword in email username',
        impact: 'positive',
        strength: 'strong',
        rawValue: username,
        explanation: `The username contains "${usernameHit}", a term strongly associated with physiotherapy practice.`,
        category: 'email-username',
      });
    } else {
      // Standalone 'ft' check (fisioterapeuta abbreviation)
      const ftPattern = /^ft$|[\._\-\d]ft[\._\-\d]|^ft[\._\-\d]|[\._\-\d]ft$/;
      if (ftPattern.test(usernameNorm)) {
        signals.push({
          factor: 'Physiotherapy abbreviation in email username',
          impact: 'positive',
          strength: 'moderate',
          rawValue: username,
          explanation: '"ft" as a standalone token in a username is a common abbreviation for "Fisioterapeuta" in Portugal.',
          category: 'email-username',
        });
      }
    }
  }

  // 5. Name signals
  const nameParts = name.trim().split(/\s+/).filter(Boolean);
  let nameSignalCount = 0;

  if (nameParts.length > 0) {
    const firstNorm = normalise(nameParts[0]);
    if (PORTUGUESE_FIRST_NAMES.has(firstNorm)) {
      signals.push({
        factor: 'Common Portuguese first name',
        impact: 'positive',
        strength: 'moderate',
        rawValue: nameParts[0],
        explanation: `"${nameParts[0]}" is among the most common first names in Portugal.`,
        category: 'name-firstname',
      });
      nameSignalCount++;
    }

    let surnameMatches = 0;
    for (let i = 1; i < nameParts.length && surnameMatches < 2; i++) {
      const partNorm = normalise(nameParts[i]);
      if (PORTUGUESE_SURNAMES.has(partNorm)) {
        signals.push({
          factor: 'Common Portuguese surname',
          impact: 'positive',
          strength: 'moderate',
          rawValue: nameParts[i],
          explanation: `"${nameParts[i]}" is one of the most frequent surnames in Portugal.`,
          category: 'name-surname',
        });
        nameSignalCount++;
        surnameMatches++;
      }
    }
  }

  if (nameSignalCount === 0) {
    signals.push({
      factor: 'Name origin not conclusive',
      impact: 'neutral',
      strength: 'weak',
      rawValue: name,
      explanation: 'The name does not match common Portuguese first names or surnames in our dataset.',
      category: 'general',
    });
  }

  return signals;
}
