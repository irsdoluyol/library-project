import PageWithHeader from "../../components/common/PageWithHeader.jsx";
import styles from "./TermsPage.module.css";

function TermsPage() {
  return (
    <PageWithHeader
      title="Условия использования и персональные данные"
      description="Краткая информация для пользователей онлайн-библиотеки."
    >
      <div className={styles.body}>
        <section className={styles.section} id="terms">
          <h2 className={styles.h2}>Условия использования</h2>
          <p>
            Регистрируясь в сервисе, вы получаете доступ к каталогу книг, функциям бронирования и чтения
            материалов в соответствии с правилами библиотеки. Запрещается злоупотребление сервисом,
            попытки несанкционированного доступа к данным других пользователей и нарушение работы системы.
          </p>
        </section>
        <section className={styles.section} id="privacy">
          <h2 className={styles.h2}>Обработка персональных данных</h2>
          <p>
            Обрабатываются данные, указанные при регистрации (имя, фамилия, адрес электронной почты), а также
            сведения об использовании сервиса (выдачи книг, обращения в поддержку), необходимые для работы
            приложения. Пароли хранятся в виде хеша; доступ к учётной записи защищён средствами аутентификации
            на сервере.
          </p>
        </section>
      </div>
    </PageWithHeader>
  );
}

export default TermsPage;
