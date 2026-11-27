import { Link } from 'react-router-dom';
import { WheatIcon, TreeIcon } from './Icons';

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Бренд и миссия */}
          <div className="footer-brand">
            <span className="footer-brand-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <WheatIcon size={28} />
              <span>VÉRITÉ</span>
            </span>
            <p className="footer-brand-desc">
              Премиальные органические продукты с семейных пасек и чистых экологических угодий. Никакой химии, честный состав и забота о будущем.
            </p>
            <div className="footer-mission-badge">
              <TreeIcon size={16} />
              <span>Высажено 14 280 деревьев совместно с фондами</span>
            </div>
          </div>

          {/* Навигация 1 */}
          <div className="footer-col">
            <h4>Каталог</h4>
            <ul>
              <li><Link to="/#catalog">Дикий мёд и пасека</Link></li>
              <li><Link to="/#catalog">Сыродавленные масла</Link></li>
              <li><Link to="/#catalog">Горные травы и сборы</Link></li>
              <li><Link to="/#catalog">Злаки и эко-семена</Link></li>
            </ul>
          </div>

          {/* Навигация 2 */}
          <div className="footer-col">
            <h4>Ценности</h4>
            <ul>
              <li><Link to="/#values">Zero Waste тара</Link></li>
              <li><Link to="/#trust">Лабораторный контроль</Link></li>
              <li><Link to="/#contact">Оптовые эко-закупки</Link></li>
              <li><Link to="/#contact">Партнёрство для фермеров</Link></li>
            </ul>
          </div>

          {/* Подписка на гайд */}
          <div className="footer-col">
            <h4>Эко-сообщество</h4>
            <div className="footer-subscribe-box">
              <p>Получите гид по осознанному питанию и сезонным сборам:</p>
              <form onSubmit={(e) => { e.preventDefault(); alert('Спасибо за подписку! Гид отправлен на ваш email.'); }} className="subscribe-input-group">
                <input type="email" placeholder="Ваш email" required />
                <button type="submit">Подписаться</button>
              </form>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div>
            Астана, Казахстан • +7 (7172) 00-00-00 • info@agromarket.kz
          </div>
          <div>
            © 2026 VÉRITÉ Organics (АгроМаркет). Все права защищены.
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;